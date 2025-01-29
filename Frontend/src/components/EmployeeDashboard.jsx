import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Clock, XCircle, Download } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import QrCode from './QrCode';
import { toPng } from 'html-to-image';

const EmployeeDashboard = () => {
  const {
    assignments,
    fetchEmployeeAssignments,
    authUser,
    isFetchingAssignments,
    updateAssignmentStatus
  } = useAuthStore();

  const qrRef = useRef(null);

  useEffect(() => {
    if (authUser?._id) {
      fetchEmployeeAssignments(authUser._id);
    }
  }, [authUser]);

  const downloadQRCode = () => {
    if (qrRef.current) {
      toPng(qrRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'qrcode.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => console.error('Error downloading QR code', error));
    }
  };

  if (isFetchingAssignments) {
    return <div className="text-center p-6">Loading assignments...</div>;
  }

  return (


    <div className='flex justify-between w-full px-14 py-4'>



      <div className="flex">
          this side is for data 



      </div>
      <div className='flex flex-col items-center gap-4'>
        {/* QR Code Container */}
        <div ref={qrRef} className="p-4 bg-white border rounded-lg">
          <QrCode userId={authUser._id} />
        </div>

        {/* Download Button */}
        <button
          onClick={downloadQRCode}
          className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600"
        >
          <Download size={18} />
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
