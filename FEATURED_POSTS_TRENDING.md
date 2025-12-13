# Featured Posts - Trending Algorithm Implementation

## Summary
I've successfully updated the Featured Posts section to show the **2 most popular posts from the last week** based on engagement metrics (likes and comments), not just views.

## Backend Changes (convex/posts.ts)

### **New Query: `getTrending`**

```typescript
export const getTrending = query({
    args: {},
    handler: async (ctx) => {
        // Get posts from last 7 days
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentPosts = await ctx.db
            .query("posts")
            .filter((q) => q.gte(q.field("_creationTime"), oneWeekAgo))
            .collect();

        // Calculate engagement score for each post
        const postsWithEngagement = await Promise.all(
            recentPosts.map(async (post) => {
                // Count likes
                const likesCount = await ctx.db
                    .query("likes")
                    .withIndex("by_post", (q) => q.eq("postId", post._id))
                    .collect()
                    .then(likes => likes.length);

                // Count comments
                const commentsCount = await ctx.db
                    .query("comments")
                    .withIndex("by_post", (q) => q.eq("postId", post._id))
                    .collect()
                    .then(comments => comments.length);

                // Calculate engagement score
                const engagementScore = post.views + (likesCount * 2) + (commentsCount * 3);

                return {
                    ...post,
                    author,
                    coverImageUrl,
                    likesCount,
                    commentsCount,
                    engagementScore,
                };
            })
        );

        // Sort by engagement score
        return postsWithEngagement
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, 10);
    },
});
```

## Frontend Changes (app/page.tsx)

### **Updated Featured Posts Logic**

```typescript
const trendingPosts = useQuery(api.posts.getTrending);
const featuredPosts = trendingPosts?.slice(0, 2) || [];
```

## Engagement Score Formula 📊

The algorithm calculates an engagement score for each post:

```
Engagement Score = Views + (Likes × 2) + (Comments × 3)
```

### **Why This Formula?**

- **Views (×1)**: Basic engagement metric
- **Likes (×2)**: More valuable than views - shows appreciation
- **Comments (×3)**: Most valuable - shows deep engagement and discussion

### **Example:**
```
Post A: 100 views + 20 likes + 5 comments
Score = 100 + (20 × 2) + (5 × 3) = 100 + 40 + 15 = 155

Post B: 150 views + 5 likes + 2 comments
Score = 150 + (5 × 2) + (2 × 3) = 150 + 10 + 6 = 166

Post B would be featured (higher score)
```

## How It Works 🔄

1. **Time Filter**: Only posts from the last 7 days are considered
2. **Engagement Calculation**: For each post:
   - Count total likes
   - Count total comments
   - Calculate engagement score
3. **Sorting**: Posts sorted by engagement score (highest first)
4. **Selection**: Top 2 posts are shown as featured

## Features ✨

### **Time-Based**
- ✅ Only shows posts from **last 7 days**
- ✅ Keeps content fresh and relevant
- ✅ Encourages recent activity

### **Engagement-Focused**
- ✅ Prioritizes **likes and comments** over just views
- ✅ Rewards quality content that sparks discussion
- ✅ Weighted scoring system

### **Automatic**
- ✅ Updates automatically as engagement changes
- ✅ No manual curation needed
- ✅ Real-time trending calculation

### **Fair**
- ✅ New posts have equal opportunity
- ✅ Not biased toward older posts with accumulated views
- ✅ Weekly reset keeps it competitive

## Benefits 🎯

1. **Promotes Quality**: Posts with high engagement get featured
2. **Encourages Interaction**: Users are incentivized to like and comment
3. **Fresh Content**: Only recent posts are considered
4. **Community-Driven**: The community decides what's trending
5. **Automatic**: No manual intervention needed

## Fallback Behavior

If there are **no posts in the last week**:
- Featured section will be empty or show fallback message
- Consider showing "No trending posts this week" message

If there's **only 1 post in the last week**:
- Only 1 featured post will show
- The grid will adapt automatically

## Performance Considerations

- Query fetches up to 10 trending posts (returns top 2 for featured)
- Engagement metrics calculated on-demand
- Cached by Convex for performance
- Efficient database queries with indexes

## Future Enhancements (Optional)

Potential improvements:

1. **Decay Factor**: Reduce score for older posts within the week
2. **Category-Specific**: Featured posts per category
3. **User Preferences**: Personalized trending based on user interests
4. **Shares**: Add share count to engagement score
5. **Time Weighting**: More recent engagement counts more

Your Featured Posts section now intelligently shows the most engaging content from the past week! 🔥
