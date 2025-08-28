import { createSlice } from '@reduxjs/toolkit';

// Try-catch to avoid JSON parse errors
let userFromStorage = null;
try {
    const item = localStorage.getItem('userData');
    if (item) userFromStorage = JSON.parse(item);
} catch (e) {
    console.error('Failed to parse userData from localStorage:', e);
}

const initialState = {
    user: userFromStorage,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem('userData', JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.user = null;
            localStorage.removeItem('userData');
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
