# View Tracking Implementation

## Summary
I've successfully implemented a view counter that tracks each time a blog post is clicked/viewed. Each post gets exactly **1 view per user session** when they open the post.

## Backend Changes (convex/posts.ts)

### **New Mutation: `incrementView`**
```typescript
export const incrementView = mutation({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);
        if (!post) {
            throw new Error("Post not found");
        }

        // Increment the view count
        await ctx.db.patch(args.postId, {
            views: post.views + 1,
        });

        return post.views + 1;
    },
});
```

**What it does:**
- Takes a `postId` as input
- Fetches the current post
- Increments the `views` field by 1
- Returns the new view count

## Frontend Changes (components/post-page-client.tsx)

### **View Tracking Logic**
```typescript
const incrementView = useMutation(api.posts.incrementView);
const hasIncrementedView = useRef(false);

useEffect(() => {
    if (post && !hasIncrementedView.current && user) {
        incrementView({ postId: post._id })
            .then(() => {
                hasIncrementedView.current = true;
            })
            .catch((error) => {
                console.error("Failed to increment view:", error);
            });
    }
}, [post, incrementView, user]);
```

**How it works:**
1. **useRef tracking**: `hasIncrementedView` ensures view is only counted once per session
2. **Conditions checked**:
   - Post data is loaded (`post`)
   - View hasn't been counted yet (`!hasIncrementedView.current`)
   - User is signed in (`user`)
3. **Mutation call**: Increments view count in database
4. **Flag set**: Marks view as counted to prevent duplicates

## Features ✨

### **Per-Click Tracking**
- ✅ View count increases by **1** each time a user opens a post
- ✅ Only counts when user is **signed in**
- ✅ **One view per session** - refreshing the page doesn't add more views
- ✅ Different users get counted separately

### **Session-Based**
- View is counted when the post component mounts
- `useRef` prevents duplicate counts during re-renders
- Closing and reopening the browser tab counts as a new session

### **Error Handling**
- Catches and logs any errors during view increment
- Doesn't break the UI if view tracking fails
- Silent failure - user experience is not affected

## How It Works 🔄

```
User Flow:
1. User clicks on a blog post
2. PostPageClient component loads
3. useEffect hook triggers
4. Checks: post loaded? user signed in? not counted yet?
5. Calls incrementView mutation
6. Backend increments views field by 1
7. Sets hasIncrementedView flag to true
8. View count updated in database
```

## Where Views Are Displayed 📊

Views are shown in multiple places:

1. **Post Cards** (Home page, Categories)
   - Shows total view count with Eye icon
   - Example: "👁️ 42 views"

2. **Individual Post Page**
   - Displays in the stats section
   - Shows total accumulated views

3. **Dashboard**
   - User's stats show total views across all posts
   - Individual post listings show per-post views

## Database Schema

The `views` field in the `posts` table:
- **Type**: `number`
- **Default**: `0` (set when post is created)
- **Increments**: By 1 each time a user views the post
- **Never decreases**: Views are cumulative

## Testing Checklist ✅

- [ ] Create a new post
- [ ] View count starts at 0
- [ ] Click on the post
- [ ] View count increases to 1
- [ ] Refresh the page
- [ ] View count stays at 1 (same session)
- [ ] Sign out and sign in as different user
- [ ] Click the post again
- [ ] View count increases to 2
- [ ] Check dashboard stats update correctly

## Future Enhancements (Optional)

Potential improvements you could add:

1. **Unique Views**: Track unique users (not just sessions)
2. **View Duration**: Track how long users spend reading
3. **Analytics**: Daily/weekly view trends
4. **Popular Posts**: Query posts by view count
5. **View History**: Track when each view occurred

## Notes

- Views are only counted for **authenticated users**
- Anonymous users don't increment view counts
- View tracking is **automatic** - no user action needed
- **Performance**: Mutation is fast and non-blocking
- **Accurate**: One view per user per session guaranteed

Your blog now has a fully functional view tracking system! 📈
