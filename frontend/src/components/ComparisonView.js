import OutlierScatter from "./OutlierScatter";
import View from "./View";
import SpiderChart from "./SpiderChart";
import SelectedTimeIntervalList from "./selectedTimeIntervalList";

export default class ComparisonView extends View {
  render() {
    return (
      <div>
        <div className="plot-view-parent">
          <SelectedTimeIntervalList />
          <SpiderChart
            startA="1999-12-01"
            endA="2000-03-01"
            startB="2000-03-01"
            endB="2000-06-01"
          />
          <OutlierScatter />
        </div>
      </div>
    );
  }
}
