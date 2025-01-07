type DataType = {
  content: string;
};

export const getStaticProps = async () => {
  const data = await fetchData(); // Fetch data at build time
  return { props: { data } };
};

const HomePage = ({ data }: { data: DataType }) => {
  return <div>{data.content}</div>;
};

export default HomePage;
function fetchData() {
  throw new Error("Function not implemented.");
}
