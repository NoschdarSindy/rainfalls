import OutlierScatter from "./OutlierScatter";
import View from "./View";

export default class ComparisonView extends View {
  
  render() {
    return (
      <div>
        <p>Ich bin ein ComparisonView</p>
        <div className="global-scatter-parent">
          <OutlierScatter />
        </div>
      </div>
    );
  }
  
}
