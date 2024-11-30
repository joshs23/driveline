export default function UserPage({
  params,
}: {
  params: Promise<{ username: string | undefined }>;
}) {
  console.log(params);

  return <p>User Page</p>;
}
