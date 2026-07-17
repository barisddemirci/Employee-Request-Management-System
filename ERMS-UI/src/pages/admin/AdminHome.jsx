import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import RequestTypesTab from './RequestTypesTab';
import DepartmentsTab from './DepartmentsTab';
import UsersTab from './UsersTab';

export default function AdminHome() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Yönetim</Typography>
      <Paper variant="outlined">
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Talep Türleri" />
          <Tab label="Departmanlar" />
          <Tab label="Kullanıcılar" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {tab === 0 && <RequestTypesTab />}
          {tab === 1 && <DepartmentsTab />}
          {tab === 2 && <UsersTab />}
        </Box>
      </Paper>
    </Box>
  );
}
