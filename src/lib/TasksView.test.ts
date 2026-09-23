import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import TasksView from './TasksView.svelte';
import { createChecksController } from './checks.svelte.js';
import { crawl } from '../../tests/fixtures/cory-trent.js';

beforeEach(() => {
	localStorage.clear();
});

function renderTasks() {
	const resolved = { id: 'cory-trent', title: crawl.appTitle, definition: crawl };
	const controller = createChecksController(resolved.id, crawl.scavenger.map((task) => task.id));
	return render(TasksView, { crawl: resolved, controller });
}

function getPercent(): string {
	return screen.getByText(/\d+% collected/).textContent ?? '';
}

describe('TasksView: checklist tally', () => {
	it('checking a 10-point task shows 10 of 85 and 12%', async () => {
		renderTasks();
		// All tasks start unchecked; sh-selfie (index 0) is 10 pts, total is 85
		const checkboxes = screen.getAllByRole('checkbox');
		await fireEvent.click(checkboxes[0]);
		await waitFor(() => {
			expect(screen.getByText('10')).toBeInTheDocument();
			expect(screen.getByText(/\/ 85 pts/)).toBeInTheDocument();
			expect(screen.getByText(/12% collected/)).toBeInTheDocument();
		});
	});

	it('unchecking a checked task lowers the tally', async () => {
		renderTasks();
		const checkboxes = screen.getAllByRole('checkbox');
		await fireEvent.click(checkboxes[0]);
		await waitFor(() => expect(screen.getByText(/12% collected/)).toBeInTheDocument());
		await fireEvent.click(checkboxes[0]);
		await waitFor(() => expect(screen.getByText(/0% collected/)).toBeInTheDocument());
	});

	it('reset clears checks after confirm', async () => {
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
		renderTasks();
		const checkboxes = screen.getAllByRole('checkbox');
		await fireEvent.click(checkboxes[0]);
		await waitFor(() => expect(screen.getByText(/12% collected/)).toBeInTheDocument());
		const resetBtn = screen.getByRole('button', { name: /reset/i });
		await fireEvent.click(resetBtn);
		await waitFor(() => expect(screen.getByText(/0% collected/)).toBeInTheDocument());
		confirmSpy.mockRestore();
	});

	it('reset is abandoned on cancel', async () => {
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
		renderTasks();
		const checkboxes = screen.getAllByRole('checkbox');
		await fireEvent.click(checkboxes[0]);
		await waitFor(() => expect(screen.getByText(/12% collected/)).toBeInTheDocument());
		const resetBtn = screen.getByRole('button', { name: /reset/i });
		await fireEvent.click(resetBtn);
		await waitFor(() => expect(screen.getByText(/12% collected/)).toBeInTheDocument());
		confirmSpy.mockRestore();
	});
});

void getPercent;
