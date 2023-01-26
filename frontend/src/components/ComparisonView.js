import OutlierScatter from "./OutlierScatter";
import View from "./View";
import SpiderChart from "./SpiderChart";
import SelectedTimeIntervalList from "./selectedTimeIntervalList";
import SelectTimeIntervalButton from "./selectedTimeIntervalButton";

export default class ComparisonView extends View {
  render() {
    return (
      <div>
        <div className="plot-view-parent">
          <SelectTimeIntervalButton />
          <SelectedTimeIntervalList />
          <SpiderChart />
          <OutlierScatter />
        </div>
      </div>
    );
  }
}
