'use client'
import React, { useState } from 'react';
import { Button, Card, Grid, TextField, Alert, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { login } from '@/store/actions-creators/auth';
import { useTypedSelector } from '@/hooks/useTypedSelector';

const LoginPage = () => {
	const router = useRouter();
	const dispatch = useDispatch<AppDispatch>();
	const { error } = useTypedSelector(state => state.auth);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [sending, setSending] = useState(false);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSending(true);
		const ok = await dispatch(login(email, password));
		if (ok) {
			router.push('/tracks');
		} else {
			setSending(false);
		}
	};

	return (
		<Grid container sx={{ justifyContent: 'center', margin: '60px 0' }}>
			<Grid size={{ xs: 12, sm: 10, md: 4 }}>
				<Card sx={{ p: '30px' }}>
					<Typography variant="h5" sx={{ mb: 3 }}>Вход</Typography>
					<form onSubmit={submit}>
						<Grid container sx={{ flexDirection: 'column', gap: '16px' }}>
							<TextField
								placeholder="Email"
								type="email"
								fullWidth
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<TextField
								placeholder="Пароль"
								type="password"
								fullWidth
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							{error && <Alert severity="error">{error}</Alert>}
							<Button type="submit" variant="contained" disabled={sending}>
								{sending ? 'Входим...' : 'Войти'}
							</Button>
						</Grid>
					</form>
					<Typography sx={{ mt: 3 }}>
						Нет аккаунта? <Link href="/register">Зарегистрируйтесь</Link>
					</Typography>
				</Card>
			</Grid>
		</Grid>
	);
};

export default LoginPage;
