import { DefaultApi as Api } from "./../client/services/DefaultApi";
import Async from "react-async";
import View from "./View";
import { Button } from "react-bootstrap";

export default class IntervalView extends View {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <p>Ich bin ein IntervalView</p>

        <Button variant={"primary"}>Select intervals</Button>
      </div>
    );
  }
}
