const Page = async ({ params }: { params: { id: string } }) => {
  return (
    <div>
      <h1>Dynamic Page works!</h1>
      <h1>{params.id}</h1>
    </div>
  );
};

export default Page;
