import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger(console.log));

// Create Supabase client helper
function getSupabaseClient(accessToken?: string) {
  if (accessToken) {
    // Client with user's access token
    return createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );
  }
  // Admin client
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

// Helper to get authenticated user
async function getAuthenticatedUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { user: null, error: 'Missing authorization token' };
  }

  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return { user: null, error: 'Invalid or expired token' };
  }

  return { user, error: null };
}

// ============================================
// HEALTH CHECK & INFO
// ============================================

// Health check
app.get('/make-server-c77f18a2/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Info endpoint (no auth required)
app.get('/make-server-c77f18a2/info', (c) => {
  return c.json({ 
    message: 'OJT Time Tracker API',
    version: '1.0.0',
    note: 'Authentication is handled client-side via Supabase Auth'
  });
});

// ============================================
// OJT SETUP ROUTES
// ============================================

// Get OJT Setup
app.get('/make-server-c77f18a2/setup', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    const { data, error } = await supabase
      .from('ojt_setup')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Get setup error:', error);
      return c.json({ error: 'Failed to fetch setup' }, 500);
    }

    return c.json({ setup: data });
  } catch (error) {
    console.error('Get setup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create/Update OJT Setup
app.post('/make-server-c77f18a2/setup', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { totalRequiredHours, previousHours, workingDays, startDate } = await c.req.json();

    if (!totalRequiredHours || !workingDays || !startDate) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    // Check if setup exists
    const { data: existingSetup } = await supabase
      .from('ojt_setup')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existingSetup) {
      // Update existing setup
      result = await supabase
        .from('ojt_setup')
        .update({
          total_required_hours: totalRequiredHours,
          previous_hours: previousHours || 0,
          working_days: workingDays,
          start_date: startDate,
        })
        .eq('user_id', user.id)
        .select()
        .single();
    } else {
      // Insert new setup
      result = await supabase
        .from('ojt_setup')
        .insert({
          user_id: user.id,
          total_required_hours: totalRequiredHours,
          previous_hours: previousHours || 0,
          working_days: workingDays,
          start_date: startDate,
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Save setup error:', result.error);
      return c.json({ error: 'Failed to save setup' }, 500);
    }

    return c.json({ setup: result.data });
  } catch (error) {
    console.error('Save setup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete OJT Setup
app.delete('/make-server-c77f18a2/setup', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    const { error } = await supabase
      .from('ojt_setup')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete setup error:', error);
      return c.json({ error: 'Failed to delete setup' }, 500);
    }

    return c.json({ message: 'Setup deleted successfully' });
  } catch (error) {
    console.error('Delete setup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// TIME LOG ROUTES
// ============================================

// Get all time logs
app.get('/make-server-c77f18a2/logs', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    const { data, error } = await supabase
      .from('time_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Get logs error:', error);
      return c.json({ error: 'Failed to fetch logs' }, 500);
    }

    return c.json({ logs: data || [] });
  } catch (error) {
    console.error('Get logs error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create time log
app.post('/make-server-c77f18a2/logs', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { date, isPresent, timeIn, timeOut, hoursWorked, accomplishment, photoUrl } = await c.req.json();

    if (!date) {
      return c.json({ error: 'Date is required' }, 400);
    }

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    const { data, error } = await supabase
      .from('time_logs')
      .insert({
        user_id: user.id,
        date,
        is_present: isPresent,
        time_in: timeIn,
        time_out: timeOut,
        hours_worked: hoursWorked || 0,
        accomplishment,
        photo_url: photoUrl,
      })
      .select()
      .single();

    if (error) {
      console.error('Create log error:', error);
      return c.json({ error: 'Failed to create log' }, 500);
    }

    return c.json({ log: data });
  } catch (error) {
    console.error('Create log error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete time log
app.delete('/make-server-c77f18a2/logs/:id', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const logId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    const { error } = await supabase
      .from('time_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete log error:', error);
      return c.json({ error: 'Failed to delete log' }, 500);
    }

    return c.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Delete log error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// CALENDAR EVENTS ROUTES
// ============================================

// Get all events
app.get('/make-server-c77f18a2/events', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Get events error:', error);
      return c.json({ error: 'Failed to fetch events' }, 500);
    }

    return c.json({ events: data || [] });
  } catch (error) {
    console.error('Get events error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create event
app.post('/make-server-c77f18a2/events', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const { title, date, description, color } = await c.req.json();

    if (!title || !date) {
      return c.json({ error: 'Title and date are required' }, 400);
    }

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title,
        date,
        description,
        color,
      })
      .select()
      .single();

    if (error) {
      console.error('Create event error:', error);
      return c.json({ error: 'Failed to create event' }, 500);
    }

    return c.json({ event: data });
  } catch (error) {
    console.error('Create event error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update event
app.put('/make-server-c77f18a2/events/:id', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('id');
    const { title, date, description, color } = await c.req.json();

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    const { data, error } = await supabase
      .from('calendar_events')
      .update({ title, date, description, color })
      .eq('id', eventId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Update event error:', error);
      return c.json({ error: 'Failed to update event' }, 500);
    }

    return c.json({ event: data });
  } catch (error) {
    console.error('Update event error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete event
app.delete('/make-server-c77f18a2/events/:id', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const eventId = c.req.param('id');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete event error:', error);
      return c.json({ error: 'Failed to delete event' }, 500);
    }

    return c.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ============================================
// STATISTICS ROUTE
// ============================================

app.get('/make-server-c77f18a2/stats', async (c) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(c.req.raw);
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient(accessToken);

    // Use the database function
    const { data, error } = await supabase.rpc('get_user_stats', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('Get stats error:', error);
      return c.json({ error: 'Failed to fetch statistics' }, 500);
    }

    return c.json({ stats: data });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Start server
Deno.serve(app.fetch);