import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Wine,
  Newspaper,
  Smartphone,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Transaction } from "@shared/schema";
import { TRANSACTION_STATUS } from "@/lib/theme";
import { formatDistanceToNow } from "date-fns";

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  role?: string;
}

const TransactionTable = ({ transactions, isLoading, role = "vendor" }: TransactionTableProps) => {
  // Get icon based on waste type
  const getWasteIcon = (wasteType: string) => {
    switch (wasteType) {
      case "plastic_pet":
      case "plastic_hdpe":
        return <Wine className="text-green-700" />;
      case "paper":
        return <Newspaper className="text-blue-700" />;
      case "ewaste":
        return <Smartphone className="text-teal-700" />;
      default:
        return <Activity className="text-purple-700" />;
    }
  };

  // Get status styling
  const getStatusStyle = (status: string) => {
    const statusConfig = TRANSACTION_STATUS[status as keyof typeof TRANSACTION_STATUS];
    if (!statusConfig) {
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        label: status
      };
    }
    return {
      bgColor: statusConfig.bgColor,
      textColor: statusConfig.color,
      label: statusConfig.label
    };
  };

  // Format date
  const formatDate = (dateString: Date) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 p-4 flex justify-between items-center">
        <CardTitle className="font-inter font-medium text-lg">Recent Transactions</CardTitle>
        <Button variant="link" className="text-green-700 hover:text-green-800 text-sm p-0">
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-green-700 border-t-transparent rounded-full"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Material</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Weight</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const isUserSeller = role === "vendor";
                  const status = getStatusStyle(transaction.status);
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="px-4 py-3 text-sm">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            {getWasteIcon(transaction.wasteType)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium">
                              {transaction.wasteType.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-600">
                              {isUserSeller ? 'Sold to Buyer' : 'Purchased'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        {transaction.quantity.toFixed(2)} kg
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm font-medium">
                        ₹{transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.bgColor} ${status.textColor}`}>
                          {status.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
