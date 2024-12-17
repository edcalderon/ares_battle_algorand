import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
} from "@nextui-org/react";
import { BossCard } from "@/components/boss-card"; // Assuming you have a BossCard component
import type { Boss }  from 'types'

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "Name", uid: "name", sortable: true },
  { name: "Health", uid: "health", sortable: true },
  { name: "Actions", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["name", "health", "actions"];


export default function BossTable({ bosses }: { bosses: Boss[] }) {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(1);

  const filteredItems = React.useMemo(() => {
    return bosses.filter((boss:any) =>
      boss.name.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [bosses, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const topContent = (
    <div className="flex justify-between items-center">
      <Input
        isClearable
        placeholder="Search by name..."
        value={filterValue}
        onClear={() => setFilterValue("")}
        onValueChange={setFilterValue}
      />
      <Button color="primary">Add Boss</Button>
    </div>
  );

  const bottomContent = (
    <div className="flex justify-between items-center">
      <Pagination
        isCompact
        showControls
        page={page}
        total={pages}
        onChange={setPage}
      />
    </div>
  );

  return (
    <Table
      isHeaderSticky
      aria-label="Bosses table"
      topContent={topContent}
      bottomContent={bottomContent}
      selectedKeys={Array.from(selectedKeys)}
      //onSelectionChange={(keys: string[]) => setSelectedKeys(new Set(keys))}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} allowsSorting={column.sortable}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={"No bosses found"} items={items}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => {
              switch (columnKey) {
                case "name":
                  return <TableCell>{item.name}</TableCell>;
                case "health":
                  return <TableCell>{item.health}</TableCell>;
                case "actions":
                  return (
                    <TableCell>
                      <Button size="sm" onClick={() => console.log(`Edit ${item.id}`)}>Edit</Button>
                      <Button size="sm" color="danger" onClick={() => console.log(`Delete ${item.id}`)}>Delete</Button>
                    </TableCell>
                  );
                default:
                  return <TableCell>{item.id}</TableCell>;
              }
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
} 