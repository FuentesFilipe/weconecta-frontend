import { Button } from '../../components/ui/button'
import './Login.scss'

export default function Login() {
	return (
		<div className='font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
			<main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
				<div className='sass-login'>
					<p>Example Login</p>
					<Button className='sass-button'>Login</Button>
				</div>
			</main>
		</div>
	)
}
