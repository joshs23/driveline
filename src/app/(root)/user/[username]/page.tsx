export default function UserPage({ params }: { params: { username: string } }) {
  console.log(params);

  return <p>User Page</p>;
}
