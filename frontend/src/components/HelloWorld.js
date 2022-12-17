import { DefaultApi as Api } from "./../client/services/DefaultApi";
import Async from "react-async";

export default function HelloWorld() {
  const getData = async () => {
    return Api.detailDetailIdGet({ id: 199900001 });
  };

  const MyComponent = () => (
    <Async promiseFn={getData}>
      {({ data, error, isPending }) => {
        if (isPending) return "Loading...";
        if (error) return `Something went wrong: ${error.message}`;
        if (data) return <p>{JSON.stringify(data, null, 2)}</p>;
        return null;
      }}
    </Async>
  );

  return MyComponent();
}
