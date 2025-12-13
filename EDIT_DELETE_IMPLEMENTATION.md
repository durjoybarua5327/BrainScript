# Edit and Delete Post Implementation

## Summary
I've successfully implemented full edit and delete functionality for posts in your BrainScript application. Users can now manage their own posts with proper authorization checks.

## Backend Changes (convex/posts.ts)

### 1. **Update Mutation** (`api.posts.update`)
- Allows users to update their own posts
- **Authorization**: Verifies the user is the post author before allowing updates
- **Slug validation**: Checks if a new slug already exists
- **Fields**: Supports updating all post fields including LeetCode-specific fields
- **Returns**: The updated post ID

### 2. **Delete Mutation** (`api.posts.deletePost`)
- Allows users to delete their own posts
- **Authorization**: Verifies the user is the post author before allowing deletion
- **Cascade delete**: Automatically removes:
  - All comments on the post
  - All likes on the post
  - All saves/bookmarks of the post
- **Returns**: Success confirmation

### 3. **GetById Query** (`api.posts.getById`)
- Fetches a single post by its ID
- Includes author details
- Used by the edit page to load existing post data

## Frontend Changes

### 1. **Dashboard Page** (`app/dashboard/page.tsx`)
Updated with:
- **Edit button** for each post (links to `/dashboard/edit/[id]`)
- **Delete button** with confirmation dialog
- **Delete confirmation modal** using AlertDialog component
- **Toast notifications** for success/error feedback
- **Stats display** showing total posts and views using `getMyStats` query
- **Proper query** using `getMyPosts` instead of `getRecent`

### 2. **Edit Page** (`app/dashboard/edit/[id]/page.tsx`)
New page created with:
- **Form pre-population** with existing post data
- **All fields** from the create page (title, slug, content, category, tags, LeetCode fields)
- **Real-time updates** using Convex mutations
- **Loading state** while fetching post data
- **Toast notifications** for success/error feedback
- **Same beautiful UI** as the create page

## Features

### Authorization
✅ Users can only edit/delete their own posts
✅ Backend validates ownership before any modification
✅ Clear error messages if unauthorized

### User Experience
✅ Confirmation dialog before deleting (prevents accidents)
✅ Toast notifications for all actions
✅ Loading states during operations
✅ Smooth navigation between pages
✅ Form validation on edit page

### Data Integrity
✅ Cascade delete removes all related data
✅ Slug uniqueness validation on update
✅ All optional fields properly handled

## How to Use

### Edit a Post
1. Go to Dashboard (`/dashboard`)
2. Find your post in the list
3. Click the **Edit** button
4. Update any fields you want
5. Click **Update** to save changes
6. You'll be redirected back to the dashboard

### Delete a Post
1. Go to Dashboard (`/dashboard`)
2. Find your post in the list
3. Click the **Delete** button
4. Confirm deletion in the dialog
5. Post and all related data will be permanently deleted

## API Reference

### Mutations
```typescript
// Update a post
api.posts.update({
  postId: Id<"posts">,
  title?: string,
  slug?: string,
  content?: string,
  category?: string,
  coverImageId?: Id<"_storage">,
  tags?: string[],
  // ... all other optional fields
})

// Delete a post
api.posts.deletePost({
  postId: Id<"posts">
})
```

### Queries
```typescript
// Get post by ID
api.posts.getById({
  postId: Id<"posts">
})

// Get current user's posts
api.posts.getMyPosts()

// Get current user's stats
api.posts.getMyStats()
```

## Testing Checklist

- [ ] Create a post
- [ ] Edit the post (change title, content, tags)
- [ ] Verify changes are saved
- [ ] Try to edit someone else's post (should fail)
- [ ] Delete your own post
- [ ] Confirm post is removed from dashboard
- [ ] Verify associated comments/likes are deleted
- [ ] Check that stats update correctly

## Notes

- All mutations include proper error handling
- Toast notifications provide user feedback
- The edit page has the same rich UI as the create page
- Deletion is permanent and cannot be undone
- All related data (comments, likes, saves) is cleaned up on delete
