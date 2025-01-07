interface ContextType {
  params: {
    id: string;
  };
}

interface DataType {
  content: string;
}

export const getServerSideProps = async (context: ContextType) => {
  const { id } = context.params;
  const response = await fetch(`/api/data/${id}`);
  const data: DataType = await response.json(); // Fetch data at runtime
  return { props: { data } };
};

const DynamicPage = ({ data }: { data: DataType }) => {
  return <div>{data.content}</div>;
};

export default DynamicPage;
