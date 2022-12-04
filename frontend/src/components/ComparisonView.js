import { DefaultApi as Api } from "./../client/services/DefaultApi";
import Async from "react-async";
import View from "./View";

export default class ComparisonView extends View {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <p>Ich bin ein ComparisonView</p>
      </div>
    );
  }
}
