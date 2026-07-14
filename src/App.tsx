import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppLayout } from '@/app/AppLayout';
import { CommandPalette } from '@/features/conversation/CommandPalette';
import { ToastContainer } from '@/components/ui/ToastContainer';

function App() {
  return (
    <Provider store={store}>
      <AppLayout />
      <CommandPalette />
      <ToastContainer />
    </Provider>
  );
}

export default App;
