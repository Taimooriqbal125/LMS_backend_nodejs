# Authentication Flow Explained

This document explains how the authentication system in your project works.

## 1. The Technology: JWT (JSON Web Tokens)
Instead of keeping "sessions" on the server, we use **JWTs**. 
*   When a user logs in, the server gives them a **Token** (a long string).
*   The user saves this token (in Postman or a browser).
*   For every sensitive request, the user sends this token in the **Header**.

## 2. The Logic Flow

### A. Signup / Login
1.  User sends `email` and `password`.
2.  **Signup**: We hash the password using `bcryptjs` (so if the DB is stolen, passwords are safe) and save it.
3.  **Login**: We compare the sent password with the hashed one.
4.  If correct, we generate a Token using a **Secret Key** (`JWT_SECRET` in `.env`).

### B. Route Protection
We created a "Security Guard" called **`authMiddleware.protect`**.

```javascript
router.post('/', authMiddleware.protect, postController.createPost);
```

When someone tries to create a post:
1.  **Check Token**: Does the request have a token in the `Authorization` header?
2.  **Verify**: Is the token valid and not expired?
3.  **Find User**: Does the user inside the token still exist?
4.  **Allow**: If everything is OK, the request moves to the controller.

## 3. How to use in Postman

### 1. Login
*   `POST /api/auth/login`
*   Receive the `{ "token": "..." }` in the response.

### 2. Create Post
*   `POST /api/posts`
*   Go to the **Authorization** tab in Postman.
*   Select **Bearer Token**.
*   Paste your token.
*   Now you can click "Send"!
