"use client";

import { Button, Input, Space, Table, TableProps, Tag, Typography } from "antd";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { SearchOutlined } from "@ant-design/icons";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";

const { Title } = Typography;
const mainUrl = "http://universities.hipolabs.com/search";

type SizeType = TableProps["size"];
type DataType = {
  key: React.Key;
  country: string;
  alpha_two_code: string;
  domains: string[];
  state_province: string | null;
  name: string;
  web_pages: string[];
};
type DataIndex = keyof DataType;

export default function DashboardPage() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(true);
  const size: SizeType = "large";
  const yScroll = true;
  const xScroll = true;
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps["confirm"], dataIndex: DataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex] != null &&
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  useEffect(() => {
    setLoading(true);
    const getData = async () => {
      await axios
        .get(`${mainUrl}`)
        .then((res) => {
          setHasData(res.data.length > 0);
          const updatedData = res.data.map((item: DataType, index: number) => ({
            ...item,
            key: index,
          }));
          setData(updatedData);
        })
        .catch((err) => {
          setHasData(false);
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    getData();
  }, []);

  const filterCountry = useMemo(
    () => Array.from(new Set(data.map((item) => item.country))).map((country) => ({ text: country, value: country })),
    [data]
  );

  const columns: TableColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      render: (_: undefined, record: DataType) => <a href={record.web_pages[0]}>Invite {record.name}</a>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
      filters: filterCountry,
      filterMode: "tree",
      filterSearch: true,
      onFilter: (value, record) => record.country.includes(value as string),
      sorter: (a, b) => a.country.localeCompare(b.country),
    },
    {
      title: "Code",
      dataIndex: "alpha_two_code",
      key: "alpha_two_code",
      width: 80,
      render: (_: undefined, record: DataType) => (
        <Tag color="blue" className="">
          {record.alpha_two_code}
        </Tag>
      ),
      sorter: (a, b) => a.alpha_two_code.localeCompare(b.alpha_two_code),
    },
  ];

  const scroll: { x?: number | string; y?: number | string } = {};
  if (yScroll) {
    scroll.y = "70vh";
  }
  if (xScroll) {
    scroll.x = 360;
  }

  const tableColumns = columns.map((item) => ({ ...item }));
  if (xScroll) {
    tableColumns[0].fixed = true;
    tableColumns[tableColumns.length - 1].fixed = "right";
  }

  const tableProps: TableProps<DataType> = {
    loading,
    size,
    footer: () => (
      <a href="http://universities.hipolabs.com/search" target="_blank" rel="noreferrer noopener">
        http://universities.hipolabs.com/search
      </a>
    ),
    scroll,
  };

  return (
    <section className="py-4">
      <div className="container">
        <Title level={4} className="text-center">
          List Of Universities
        </Title>
        <Table<DataType>
          pagination={{ position: ["topCenter", "bottomRight"] }}
          {...tableProps}
          columns={columns}
          dataSource={hasData ? data : []}
        />
      </div>
    </section>
  );
}
