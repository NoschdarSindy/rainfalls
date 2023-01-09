export default function Table(props) {
  return (
    <p>
      Hier könnte sich die Tabellenansicht usw. für den{" "}
      {props.intervalViewId ? "rechten" : "linken"} IntervalView befinden
    </p>
  );
}
