import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import TasksView from './TasksView.svelte';
import { createChecksController } from './checks.svelte.js';
import { buildCrawl, task } from '../../tests/fixtures/crawl-builders.js';

// Points total 100, so checking the first task shows 10 of 100 and 10%.
const tasks = [
	task({ id: 'first-task', title: 'First Task', points: 10 }),
	task({ id: 'second-task', title: 'Second Task', points: 40 }),
	task({ id: 'third-task', title: 'Third Task', points: 50 }),
];
const crawl = buildCrawl('lantern-loop', { definition: { scavenger: tasks } });
const taskIds = tasks.map((item) => item.id);

beforeEach(() => {
	localStorage.clear();
});

function renderTasks() {
	const controller = createChecksController(crawl.id, taskIds);
	return render(TasksView, { crawl, controller });
}

function getPercent(): string {
	return screen.getByText(/\d+% collected/).textContent ?? '';
}

describe('TasksView: checklist tally', () => {
	it('does not render a special album button for an obsolete album field', () => {
		const resolved = { ...crawl, definition: { ...crawl.definition, albumUrl: 'https://example.com/album' } };
		const controller = createChecksController(resolved.id, taskIds);
		render(TasksView, { crawl: resolved, controller });
		expect(screen.queryByRole('link', { name: /Open group album/ })).not.toBeInTheDocument();
	});
	it('checking a 10-point task shows 10 of 100 and 10%', async () => {
		renderTasks();
		const checkboxes = screen.getAllByRole('checkbox');
		await fireEvent.click(checkboxes[0]);
		await waitFor(() => {
			expect(screen.getByText('10')).toBeInTheDocument();
			expect(screen.getByText(/\/ 100 pts/)).toBeInTheDocument();
			expect(screen.getByText(/10% collected/)).toBeInTheDocument();
		});
	});

	it('unchecking a checked task lowers the tally', async () => {
		renderTasks();
		const checkboxes = screen.getAllByRole('checkbox');
		await fireEvent.click(checkboxes[0]);
		await waitFor(() => expect(screen.getByText(/10% collected/)).toBeInTheDocument());
		await fireEvent.click(checkboxes[0]);
		await waitFor(() => expect(screen.getByText(/0% collected/)).toBeInTheDocument());
	});

	it('reset clears checks after confirm', async () => {
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
		renderTasks();
		const checkboxes = screen.getAllByRole('checkbox');
		await fireEvent.click(checkboxes[0]);
		await waitFor(() => expect(screen.getByText(/10% collected/)).toBeInTheDocument());
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
		await waitFor(() => expect(screen.getByText(/10% collected/)).toBeInTheDocument());
		const resetBtn = screen.getByRole('button', { name: /reset/i });
		await fireEvent.click(resetBtn);
		await waitFor(() => expect(screen.getByText(/10% collected/)).toBeInTheDocument());
		confirmSpy.mockRestore();
	});
});

void getPercent;
