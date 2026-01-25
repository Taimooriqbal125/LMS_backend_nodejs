# Email OTP Verification Flow

This project now requires users to verify their email using a 6-digit OTP (One-Time Password) before they can log in or create posts.

## 1. How it works (The Logic)

1.  **Signup**: When a user signs up, the server generates a 6-digit code and a 10-minute expiry time.
2.  **Email**: The code is "sent" to the email (shown in your terminal console).
3.  **Verification**: The user sends the code to `/verify-otp`. If correct, the account is activated.
4.  **Protection**: Any route using `authMiddleware.protect` will now check if `isVerified` is `true`.

## 2. How to test in Postman

### Step 1: Signup
*   `POST /api/auth/signup`
*   JSON: `{ "name": "Alex", "email": "alex@example.com", "password": "password123" }`
*   **Check your terminal!** You will see a box like this:
    ```
    📧 SENDING EMAIL TO: alex@example.com
    🔢 MESSAGE: Your OTP is: 123456...
    ```

### Step 2: Verify OTP
*   `POST /api/auth/verify-otp`
*   JSON: `{ "email": "alex@example.com", "otp": "123456" }`
*   **Result**: You get a success message and your **JWT Token**.

### Step 3: Login (Optional)
If you log in later, the server will check if you are verified. If not, it will tell you to verify first.

### Step 4: Resend OTP (If code expires)
*   `POST /api/auth/resend-otp`
*   JSON: `{ "email": "alex@example.com" }`

## 3. Security Notes
*   **Expirations**: OTPs only last 10 minutes.
*   **Hashing**: Your password is still securely hashed with Bcrypt.
*   **Simulation**: We are using a console logger for emails right now. In a real app, you'd swap the code in `src/utils/emailService.js` to use a real provider.
