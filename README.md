# Next + Firebase starter

![zen and the art of coding logo](https://res.cloudinary.com/dwvlpyo5f/image/upload/v1718811910/next-firebase-starter_v6dold.jpg)

## ℹ️ About

This is a full-stack web-app boilerplate starter.

This is a [Next.js 14](https://nextjs.org/) web-app using the `app directory`, [Tailwind CSS](https://tailwindcss.com/), TypeScript, Google's [Firebase](https://firebase.google.com/) and [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) for state management.

This starter uses the Firebase SDK for authentication and includes functioning Sign Up _(email, password, and username)_, Login and Forgot Password pages. Once a user is logged in, user data _(uid, email, and username)_ is synced with the state management store and persisted using cookies 🍪 to maintain the login state across page refreshes.

Once logged in, users are redirected to a profile page where there is a functioning Log Out button and a link to a Profile Settings page where updates to the user profile details _(username, email, and password)_ can be made.

## 💻 Getting Started

- Create & register a Firebase app
- Rename `.env.example` to `.env.local`
- Add project environment variables
- Install dependencies

```bash
npm i
```

- Start Node.js local development server

```bash
npm run dev
```
