// Inside src/app/api/auth/signup/route.ts
const cleanEmail = email.trim().toLowerCase();
const passwordHash = await bcrypt.hash(password, 10);

const user = await prisma.user.create({
  data: {
    email: cleanEmail,
    passwordHash: passwordHash, // Match your schema column
    role: "USER",
  },
});
