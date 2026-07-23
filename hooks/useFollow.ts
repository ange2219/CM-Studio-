'use client'

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';

export function useFollow() {
  const { user: currentUser } = useUser();
  const supabase = createClient();
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch current user's followings at load
  useEffect(() => {
    async function loadFollows() {
      if (!currentUser?.id) {
        setFollowedIds(new Set());
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', currentUser.id);

        if (data) {
          setFollowedIds(new Set(data.map((f: any) => f.following_id)));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des abonnements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFollows();
  }, [currentUser?.id, supabase]);

  const toggleFollow = useCallback(async (targetUserId: string, targetName?: string) => {
    if (!currentUser?.id || currentUser.id === targetUserId) return;

    const isCurrentlyFollowing = followedIds.has(targetUserId);
    
    // Optimistic state update
    setFollowedIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyFollowing) {
        next.delete(targetUserId);
      } else {
        next.add(targetUserId);
      }
      return next;
    });

    if (isCurrentlyFollowing) {
      // Unfollow
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .match({ follower_id: currentUser.id, following_id: targetUserId });

      if (error) {
        console.error('Erreur lors du désabonnement:', error);
        // Rollback state on error
        setFollowedIds(prev => new Set(prev).add(targetUserId));
      }
    } else {
      // Follow
      const { error } = await supabase
        .from('user_follows')
        .insert({ follower_id: currentUser.id, following_id: targetUserId });

      if (error) {
        console.error('Erreur lors de l\'abonnement:', error);
        // Rollback state on error
        setFollowedIds(prev => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      } else {
        // Send follow notification to target user
        try {
          await supabase.from('notifications').insert({
            user_id: targetUserId,
            type: 'follow',
            title: 'Nouvel abonné',
            message: `${currentUser.full_name || 'Un utilisateur'} a commencé à vous suivre.`,
            action_url: `/profile/${currentUser.username || currentUser.id}`,
            platform: 'cm_studio',
            is_read: false
          });
        } catch (notifErr) {
          console.error('Erreur insertion notification follow:', notifErr);
        }
      }
    }
  }, [currentUser, followedIds, supabase]);

  const isFollowing = useCallback((targetUserId: string) => {
    return followedIds.has(targetUserId);
  }, [followedIds]);

  return {
    followedIds,
    isFollowing,
    toggleFollow,
    loading
  };
}
