import { createLazyFileRoute } from '@tanstack/react-router'
import { DayPage } from '../components/DayPage'

export const Route = createLazyFileRoute('/day/$date')({ component: DayPage })
