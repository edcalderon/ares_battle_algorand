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
  Pagination,
  useDisclosure,
  User,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  SortDescriptor,
  Selection,
  Chip,
  ChipProps
} from "@nextui-org/react";
import type { Boss } from 'types'
import CreateBossModal from './create-boss-modal';
import { allCollection } from 'greek-mythology-data';
import { VerticalDotsIcon, SearchIcon, PlusIcon } from "@/lib/icons";
import { AresBattleClient } from '@/artifacts/AresBattleClient';
import { getAlgodConfigFromEnvironment } from '../lib/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet as useWalletReact } from '@txnlab/use-wallet-react'
import Link from 'next/link';
import { useLocale } from "next-intl";

export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "Name", uid: "name", sortable: true },
  { name: "Health", uid: "health", sortable: true },
  { name: "Status", uid: "status", sortable: true },
  { name: "Version", uid: "version", sortable: true },
  { name: "Actions", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["name", "health", "status", "version", "actions"];

export default function BossTable({ bosses }: { bosses: Boss[] }) {
  const { activeAddress, transactionSigner } = useWalletReact()
  const [filterValue, setFilterValue] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [page, setPage] = React.useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [gods, setGods] = React.useState<any[]>([]);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const hasSearchFilter = Boolean(filterValue);
  const algodConfig = getAlgodConfigFromEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })
  algorand.setDefaultSigner(transactionSigner)
  const locale = useLocale();

  const filteredItems = React.useMemo(() => {
    return bosses.filter((boss: any) =>
      boss.name.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [bosses, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);


  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 w-full max-w-screen-lg ">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            placeholder="Search by name..."
            size="sm"
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Button color="primary" onClick={onOpen} endContent={<PlusIcon />} size="sm">
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">{filteredItems.length} Bosses Found</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    items.length,
    hasSearchFilter,
  ]);

  const bottomContent = (
    <div className="flex justify-between items-center">
      <Pagination
        isCompact
        showControls
        page={page}
        total={pages}
        onChange={setPage}
      />
      <span className="text-small text-default-400">
        Total {bosses.length} Bosses
      </span>
    </div>
  );

  React.useEffect(() => {
    const filteredData = Array.from(allCollection).filter((character: any) => character.category === 'major olympians');
    setGods(filteredData)
  }, [allCollection]);

  const godImage = (name: string) => gods.find(god => god.name === name)?.images?.regular;

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: Boss, b: Boss) => {
      const first = a[sortDescriptor.column as keyof Boss] as number;
      const second = b[sortDescriptor.column as keyof Boss] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleDelete = async (itemId: number) => {
    const client = algorand.client.getTypedAppClientById(AresBattleClient, {
      appId: BigInt(itemId),
    });
  };

  const statusColorMap: Record<string, ChipProps["color"]> = {
    ACTIVE: "success",
    PAUSED: "danger",
    DEFEATED: "warning",
  };

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Bosses table"
        topContent={topContent}
        bottomContent={bottomContent}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} allowsSorting={column.sortable} align={column.uid === "actions" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No bosses found"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => {
                switch (columnKey) {
                  case "name":
                    return <TableCell>
                      <User
                        avatarProps={{ radius: "lg", src: godImage(item.name) }}
                        description={item.name}
                        name={item.name}
                      >
                        {item.name}
                      </User>
                    </TableCell>;
                  case "health":
                    return <TableCell>{item.health}</TableCell>;
                  case "status":
                    return (
                      <TableCell>
                        <Chip className="capitalize" color={statusColorMap[item?.status.toLocaleUpperCase()] || 'success'} size="sm" variant="flat">
                          {item?.status.toLocaleLowerCase() || 'none'}
                        </Chip>
                      </TableCell>
                    );
                  case "version":
                    return <TableCell>{item.version}</TableCell>;
                  case "actions":
                    return (
                      <TableCell>
                        <div className="relative flex justify-end items-center gap-2">
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <VerticalDotsIcon />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                              <DropdownItem key="view">View</DropdownItem>
                              <DropdownItem key="edit">Edit</DropdownItem>
                              <DropdownItem key="delete" onClick={() => handleDelete(item.id)}>Delete</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    );
                  default:
                    return <TableCell>
                      <Link href={`/boss/${item.id}`} passHref>
                        {item.id.toString()}
                      </Link>
                    </TableCell>;
                }
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CreateBossModal isOpen={isOpen} onClose={onClose} />
    </>
  );
} 