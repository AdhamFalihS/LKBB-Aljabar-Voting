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

    const votesToAdd = parseInt(vote_count);

    // Step 1: Check if voter exists
    let { data: voter, error: voterError } = await supabase
      .from('voters')
      .select('*')
      .eq('name', voter_name)
      .single();

    if (voterError && voterError.code !== 'PGRST116') throw voterError;

    let voter_id;
    let currentVoterVotes = 0;

    if (!voter) {
      // Create new voter jika belum ada
      const { data: newVoter, error: createError } = await supabase
        .from('voters')
        .insert({ name: voter_name, total_votes: 0 })
        .select()
        .single();

      if (createError) throw createError;
      voter_id = newVoter.id;
      currentVoterVotes = 0;
    } else {
      voter_id = voter.id;
      currentVoterVotes = voter.total_votes || 0;
    }

    // Step 2: Update voter total votes (Tanpa supabase.raw)
    const { error: updateVoterError } = await supabase
      .from('voters')
      .update({ total_votes: currentVoterVotes + votesToAdd })
      .eq('id', voter_id);

    if (updateVoterError) throw updateVoterError;

    // Step 3: Update school total votes
    // Kita ambil data sekolah dulu agar penambahannya akurat
    const { data: school, error: schoolFetchError } = await supabase
      .from('schools')
      .select('total_votes')
      .eq('id', school_id)
      .single();

    if (schoolFetchError) throw schoolFetchError;

    const { error: updateSchoolError } = await supabase
      .from('schools')
      .update({ total_votes: (school.total_votes || 0) + votesToAdd })
      .eq('id', school_id);

    if (updateSchoolError) throw updateSchoolError;

    // Step 4: Insert vote transaction record
    const { data: voteRecord, error: voteError } = await supabase
      .from('votes')
      .insert({
        voter_id,
        school_id,
        vote_count: votesToAdd
      })
      .select()
      .single();

    if (voteError) throw voteError;

    return res.status(200).json({ 
      success: true,
      data: voteRecord,
      message: `Berhasil mengirim ${votesToAdd} vote untuk sekolah ID ${school_id}`
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}