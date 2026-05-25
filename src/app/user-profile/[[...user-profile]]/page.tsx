import { UserProfile } from "@clerk/nextjs";

export default function UserProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <UserProfile />
    </div>
  );
}
