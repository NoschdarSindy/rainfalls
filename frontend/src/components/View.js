import { Component } from "react";

//Abstract class
export default class View extends Component {
  constructor(props) {
    super(props);
    this.title = props.title;
  }
}
