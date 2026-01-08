import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth-helpers';

/**
 * GET /api/analytics
 * Haal analytics statistieken op voor de ingelogde gebruiker
 */
export async function GET(request: NextRequest) {
  try {
    // Haal user ID op
    let userId: string | null = null;
    try {
      userId = await getUserId(request, true); // allowAnonymous voor development
    } catch (authError) {
      // Voor development: gebruik null
      userId = null;
    }

    // Start query builder
    let query = supabaseAdmin
      .from('music_analyses')
      .select('*');
    
    // Filter op user_id (of null voor anonymous)
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }
    
    // Haal alle analyses op (zonder limit voor analytics)
    const { data: analyses, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analyses for analytics:', error);
      return NextResponse.json(
        { error: 'Fout bij ophalen van analyses', details: error.message },
        { status: 500 }
      );
    }

    if (!analyses || analyses.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalTracks: 0,
          totalDuration: 0,
          avgDuration: 0,
          avgDurationFormatted: '0:00',
          genreDistribution: [],
          bpmDistribution: [],
          keyDistribution: [],
          activityTimeline: [],
          totalMixes: 0, // Placeholder - kan later worden toegevoegd
        },
      });
    }

    // Bereken statistieken
    const totalTracks = analyses.length;
    
    // Totale duur en gemiddelde
    const totalDurationSeconds = analyses.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
    const avgDurationSeconds = totalDurationSeconds / totalTracks;
    const avgMinutes = Math.floor(avgDurationSeconds / 60);
    const avgSeconds = Math.floor(avgDurationSeconds % 60);
    const avgDurationFormatted = `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`;

    // Genre distributie
    const genreCounts: Record<string, number> = {};
    analyses.forEach(a => {
      if (a.genre) {
        genreCounts[a.genre] = (genreCounts[a.genre] || 0) + 1;
      }
    });
    const genreDistribution = Object.entries(genreCounts)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / totalTracks) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 genres

    // BPM distributie (groeperen in ranges)
    const bpmRanges = [
      { label: '60-80', min: 60, max: 80 },
      { label: '80-100', min: 80, max: 100 },
      { label: '100-120', min: 100, max: 120 },
      { label: '120-140', min: 120, max: 140 },
      { label: '140-160', min: 140, max: 160 },
      { label: '160+', min: 160, max: 999 },
    ];
    const bpmDistribution = bpmRanges.map(range => {
      const count = analyses.filter(a => 
        a.bpm && a.bpm >= range.min && a.bpm < range.max
      ).length;
      return {
        range: range.label,
        count,
        percentage: Math.round((count / totalTracks) * 100),
      };
    });

    // Key distributie
    const keyCounts: Record<string, number> = {};
    analyses.forEach(a => {
      if (a.key) {
        keyCounts[a.key] = (keyCounts[a.key] || 0) + 1;
      }
    });
    const keyDistribution = Object.entries(keyCounts)
      .map(([key, count]) => ({
        key,
        count,
        percentage: Math.round((count / totalTracks) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12); // Top 12 keys

    // Activity timeline (analyses per maand, laatste 12 maanden)
    const now = new Date();
    const months: { month: string; count: number; monthKey: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });
      months.push({ month: monthLabel, monthKey, count: 0 });
    }

    analyses.forEach(a => {
      if (a.created_at) {
        const createdDate = new Date(a.created_at);
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
        const monthEntry = months.find(m => m.monthKey === monthKey);
        if (monthEntry) {
          monthEntry.count++;
        }
      }
    });

    // Format total duration
    const totalHours = Math.floor(totalDurationSeconds / 3600);
    const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
    const totalDurationFormatted = totalHours > 0 
      ? `${totalHours}u ${totalMinutes}m`
      : `${totalMinutes}m`;

    return NextResponse.json({
      success: true,
      data: {
        totalTracks,
        totalDuration: totalDurationSeconds,
        totalDurationFormatted,
        avgDuration: avgDurationSeconds,
        avgDurationFormatted,
        genreDistribution,
        bpmDistribution,
        keyDistribution,
        activityTimeline: months,
        totalMixes: 0, // Placeholder
      },
    });
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

