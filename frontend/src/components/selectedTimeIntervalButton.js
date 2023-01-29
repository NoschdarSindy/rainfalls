import { Button } from "react-bootstrap";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  intervalRangeAtom,
  intervalComparisonCandidateListAtom,
} from "../recoil/atoms";

export default function SelectTimeIntervalButton() {
  const currentInterval = useRecoilValue(intervalRangeAtom);
  const setIntervalComparisonCandidateList = useSetRecoilState(
    intervalComparisonCandidateListAtom
  );

  function handleClick() {
    // Grab the currently selected time interval from the GlobalTimeline Chart
    // and add it to the list of candidate intervals for further comparison
    setIntervalComparisonCandidateList((oldIntervalList) => [
      ...oldIntervalList,
      currentInterval,
    ]);
  }

  return (
    <Button onClick={handleClick} variant="primary">
      Save selected Time-Interval for Comparison
    </Button>
  );
}
