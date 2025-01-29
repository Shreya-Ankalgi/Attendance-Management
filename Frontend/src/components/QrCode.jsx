import React from 'react'
import QRCode from "react-qr-code";

const QrCode = ({userId}) => {
  return (
    <div>
      <QRCode value={userId} size={200} />
    </div>
  )
}

export default QrCode
