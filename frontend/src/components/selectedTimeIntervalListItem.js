import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DeleteIcon from "@mui/icons-material/Delete";

import { useSetRecoilState } from "recoil";
import { intervalComparisonCandidateListAtom } from "../recoil/atoms";

export default function SelectedTimeIntervalListItem(props) {
  const setIntervalComparisonCandidateList = useSetRecoilState(
    intervalComparisonCandidateListAtom
  );
  const localeOpts = { timeZone: "UTC" };
  const start = new Date(props.intervalRange.min).toLocaleString(
    "de-DE",
    localeOpts
  );
  const end = new Date(props.intervalRange.max).toLocaleString(
    "de-DE",
    localeOpts
  );

  const label = start + " - " + end;

  function handleDelete(index) {
    setIntervalComparisonCandidateList((oldIntervalList) => {
      let newList = [...oldIntervalList];
      newList.splice(index, 1);

      return newList;
    });
  }

  return (
    <ListItem
      secondaryAction={
        <IconButton
          onClick={() => handleDelete(props.intervalIndex)}
          edge="end"
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar>
          <DateRangeIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={label} secondary={props.intervalIndex} />
    </ListItem>
  );
}
