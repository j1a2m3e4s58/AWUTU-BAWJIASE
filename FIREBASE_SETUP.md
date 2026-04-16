# Firebase Setup

## Collections

Create these Firestore collections as the app is used:

- `announcements`
- `archiveDocuments`
- `communityEvents`
- `contactMessages`
- `galleryItems`
- `historyContents`
- `kings`
- `trainingVideos`
- `tributeMessages`
- `users`

The admin UI will create documents automatically when an authenticated admin writes data.

## Storage

Uploads now target `public/uploads/...` so published media and document files can be read by the public site.

## Admin Auth

Admin access is controlled by the Firebase custom claim `admin: true`.

Your admin user should also have a matching Firestore profile in `users/{uid}`, for example:

```json
{
  "email": "admin@example.com",
  "name": "Site Admin",
  "role": "admin"
}
```

## Next Deployment Steps

1. Sign in to Firebase CLI with the project owner account.
2. Select project `royal-heritage-app-e8d2d`.
3. Deploy rules:
   - `firebase deploy --only firestore:rules,storage`
4. Add the admin custom claim for the right Firebase Auth user.
5. Sign in with that user and start creating content from the admin screens.
