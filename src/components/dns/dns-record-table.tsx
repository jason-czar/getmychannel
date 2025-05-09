
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Check } from "lucide-react";
import { getFormattedTTL } from "./ttl-select";

export interface DNSRecord {
  id?: string;
  type: string;
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
}

interface DNSRecordTableProps {
  records: DNSRecord[];
  fullDomain: string;
  deleting: string | null;
  onDeleteRecord: (recordId: string) => void;
}

const DNSRecordTable: React.FC<DNSRecordTableProps> = ({
  records,
  fullDomain,
  deleting,
  onDeleteRecord
}) => {
  const formatRecordName = (name: string) => {
    // If name exactly matches the full domain, show @ (root)
    if (name === fullDomain) {
      return "@";
    }
    
    // If name ends with the full domain, remove it to show subdomain
    if (name.endsWith(`.${fullDomain}`)) {
      return name.replace(`.${fullDomain}`, "");
    }
    
    return name;
  };

  // Group records by type for better organization
  const recordsByType = records.reduce((acc, record) => {
    const type = record.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(record);
    return acc;
  }, {} as Record<string, DNSRecord[]>);

  const hasNSRecords = !!recordsByType['NS'] && recordsByType['NS'].length > 0;
  const hasURLRecords = !!recordsByType['URL'] && recordsByType['URL'].length > 0;

  return (
    <div className="space-y-4">
      {hasNSRecords && (
        <div className="bg-purple-50 p-3 rounded-lg mb-4">
          <p className="text-purple-800 text-sm">
            <strong>Nameserver Delegation:</strong> This domain is delegated to custom nameservers. 
            DNS records may be managed by an external provider.
          </p>
        </div>
      )}
      
      {hasURLRecords && (
        <div className="bg-indigo-50 p-3 rounded-lg mb-4">
          <p className="text-indigo-800 text-sm">
            <strong>Domain Forwarding:</strong> This domain is configured to redirect to another URL.
          </p>
        </div>
      )}
    
      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Content</TableHead>
              {records.some(record => record.type === 'MX') && (
                <TableHead>Priority</TableHead>
              )}
              <TableHead>TTL</TableHead>
              <TableHead>Proxied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No DNS records found for this domain
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.type}</TableCell>
                  <TableCell>{formatRecordName(record.name)}</TableCell>
                  <TableCell className="max-w-xs truncate">{record.content}</TableCell>
                  {records.some(record => record.type === 'MX') && (
                    <TableCell>{record.type === 'MX' ? record.priority : "—"}</TableCell>
                  )}
                  <TableCell>{getFormattedTTL(record.ttl || 1)}</TableCell>
                  <TableCell>
                    {record.proxied !== undefined ? (
                      record.proxied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        "—"
                      )
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteRecord(record.id || "")}
                      disabled={!record.id || deleting === record.id}
                    >
                      {deleting === record.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DNSRecordTable;
