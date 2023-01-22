import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Grid from "@mui/material/Grid";
import { useRecoilValue } from "recoil";
import { intervalComparisonCandidateListAtom } from "../recoil/atoms";
import SelectedTimeIntervalListItem from "./selectedTimeIntervalListItem";

export default function SelectedTimeIntervalList() {
  const intervalComparisonCandidateList = useRecoilValue(
    intervalComparisonCandidateListAtom
  );
  let itemList = [];

  intervalComparisonCandidateList.forEach((element, index) => {
    itemList.push(
      <SelectedTimeIntervalListItem
        key={index}
        intervalIndex={index}
        intervalRange={element}
      />
    );
  });

  return (
    <Box>
      <Grid>
        <List>{itemList}</List>
      </Grid>
    </Box>
  );
}
