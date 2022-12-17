import { Col, Row } from "react-bootstrap";
import List from "@mui/material/List";
import Condition from "./Condition";

export default function Filter(props) {
  const field = props.field;
  const { label, conditions } = props.filter;

  return (
    <>
      <Row className={"filter-row"}>
        <Col
          xs={3}
          className={"d-flex justify-content-end align-items-center px-0"}
        >
          {label}
        </Col>
        <Col className={"col-auto"}>
          <List sx={{ width: "fit-content", userSelect: "none" }}>
            {conditions.map((c, conditionIndex) => {
              return (
                <Condition
                  field={field}
                  conditionIndex={conditionIndex}
                  key={`${field}.${conditionIndex}`}
                />
              );
            })}
          </List>
        </Col>
      </Row>
    </>
  );
}
