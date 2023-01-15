import { DefaultApi as Api } from "./../client/services/DefaultApi";
import Async from "react-async";
import View from "./View";
import GlobalScatter from "./GlobalScatter";

export default class ComparisonView extends View {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <p>Ich bin ein ComparisonView</p>
        <div className="global-scatter-parent">
          <GlobalScatter field="area" bins={20} />
          <GlobalScatter field="length" bins={20} />
          <GlobalScatter field="severity_index" bins={20} />
        </div>
      </div>
    );
  }
}
