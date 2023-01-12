import { DefaultApi as Api } from "./../client/services/DefaultApi";
import Async from "react-async";
import View from "./View";
import GlobalScatter from "./GlobalScatter";
import SpiderChart from "./SpiderChart";

export default class ComparisonView extends View {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="plot-view-parent">
          <SpiderChart startA="1999-12-01" endA="2000-03-01" startB="2000-03-01" endB="2000-06-01" locale="de-DE" />
          <GlobalScatter field="area" bins={20}/>
          <GlobalScatter field="length" bins={20}/>
          <GlobalScatter field="severity_index" bins={20}/>
        </div>
      </div>
    );
  }
}
