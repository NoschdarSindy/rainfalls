import { Button, Col, Modal, Row } from "react-bootstrap";
import FilterByDropdown from "./FilterByDropdown";
import Filter from "./Filter";
import { DefaultApi as Api } from "../../client";
import {
  filtersAtom,
  previousFiltersAtom,
  filterByDropdownItemsAtom,
  filterModalVisibleAtom,
} from "../../recoil/atoms";
import { filtersToQueryParamsState } from "../../recoil/selectors";
import { useRecoilState, useRecoilValue } from "recoil";
import Async from "react-async";
import FilterChip from "./FilterChip";

export default function FilterModal() {
  const [filters, setFilters] = useRecoilState(filtersAtom);
  const [previousFilters, setPreviousFilters] =
    useRecoilState(previousFiltersAtom);
  const filterByDropdownItems = useRecoilValue(filterByDropdownItemsAtom);
  const filtersToQueryParams = useRecoilValue(filtersToQueryParamsState);

  const [show, setShow] = useRecoilState(filterModalVisibleAtom);

  const handleShow = () => {
    setPreviousFilters(() => filters);
    setShow(true);
  };

  const handleCancel = () => {
    setFilters(() => previousFilters);
    handleSave();
  };

  const handleSave = () => {
    setPreviousFilters(() => {});
    setShow(false);
  };

  const formInvalid = () =>
    document.querySelector(".filter-modal form:invalid");

  const getNumResults = () => {
    const getData = ({ requestBody }) => {
      console.log(filtersToQueryParams);
      return Api.queryQueryGet({
        limit: 0,
        filterParams: filtersToQueryParams,
      });
    };

    return (
      <Async promiseFn={getData}>
        <Async.Pending>...</Async.Pending>
        <Async.Fulfilled>
          {(data) => data.count.toLocaleString()}
        </Async.Fulfilled>
      </Async>
    );
  };

  const renderChips = () => {
    const referenceFilters = show ? previousFilters : filters;
    return Object.keys(referenceFilters).map((field) =>
      referenceFilters[field].conditions
        .filter((c) => c.enabled)
        .map((c, cIndex) => [
          <FilterChip
            field={field}
            condition={c}
            conditionIndex={cIndex}
            key={`${field}.${cIndex}.chip`}
          />,
        ])
    );
  };

  const renderFilters = () =>
    Object.keys(filters).length > 0 ? (
      Object.keys(filters).map((field) => (
        <Filter filter={filters[field]} field={field} key={field}></Filter>
      ))
    ) : (
      <div className={"text-center"}>No filters selected.</div>
    );

  return (
    <>
      <Row className="border-top pt-1">
        <Col className="align-bottom">
          <Button onClick={handleShow} variant="primary btn-sm">
            Filter
          </Button>
          {renderChips()}
        </Col>
        <Col className="me-1 text-end d-flex align-items-center num-results-container">
          {show ? (
            ""
          ) : (
            <span className={"num-results"}>
              {getNumResults()}&nbsp;results
            </span>
          )}
        </Col>
      </Row>

      <Modal
        show={show}
        onHide={handleCancel}
        dialogClassName="filter-modal"
        backdrop="static"
      >
        <form>
          <Modal.Header closeButton>
            <Modal.Title>Filters</Modal.Title>
          </Modal.Header>
          <Modal.Body className={"filter-modal-content"}>
            <Row>
              <Col xs={3} className={"d-flex justify-content-end px-0"}>
                <FilterByDropdown items={filterByDropdownItems} />
              </Col>
            </Row>
            {renderFilters()}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Load {formInvalid() ? "" : getNumResults()} results
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
}
