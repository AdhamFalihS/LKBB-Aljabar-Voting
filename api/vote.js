import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { voter_name, school_id, vote_count } = req.body;

    // Validation
    if (!voter_name || !school_id || !vote_count) {
      return res.status(400).json({ 
        error: 'Missing required fields: voter_name, school_id, vote_count' 
      });
    }

    if (vote_count < 1) {
      return res.status(400).json({ error: 'Vote count must be at least 1' });
    }

    // Step 1: Check if voter exists, if not create
    let { data: voter, error: voterError } = await supabase
      .from('voters')
      .select('*')
      .eq('name', voter_name)
      .single();

    if (voterError && voterError.code !== 'PGRST116') {
      throw voterError;
    }

    let voter_id;

    if (!voter) {
      // Create new voter
      const { data: newVoter, error: createError } = await supabase
        .from('voters')
        .insert({ name: voter_name, total_votes: 0 })
        .select()
        .single();

      if (createError) throw createError;
      voter_id = newVoter.id;
    } else {
      voter_id = voter.id;
    }

    // Step 2: Update voter total votes
    const { error: updateVoterError } = await supabase
      .from('voters')
      .update({ 
        total_votes: supabase.raw(`total_votes + ${vote_count}`) 
      })
      .eq('id', voter_id);

    if (updateVoterError) throw updateVoterError;

    // Step 3: Update school total votes
    const { error: updateSchoolError } = await supabase
      .from('schools')
      .update({ 
        total_votes: supabase.raw(`total_votes + ${vote_count}`) 
      })
      .eq('id', school_id);

    if (updateSchoolError) throw updateSchoolError;

    // Step 4: Insert vote transaction
    const { data: voteRecord, error: voteError } = await supabase
      .from('votes')
      .insert({
        voter_id,
        school_id,
        vote_count
      })
      .select()
      .single();

    if (voteError) throw voteError;

    return res.status(200).json({ 
      success: true,
      data: voteRecord,
      message: `Successfully voted ${vote_count} time(s) for school ID ${school_id}`
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}