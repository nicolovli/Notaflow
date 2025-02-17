	// src/components/__tests__/CourseCard.test.tsx
	import { describe, it, expect } from 'vitest';
	import { render, screen } from '@testing-library/react';
	import { MemoryRouter } from 'react-router-dom';
	import CourseCard from '../CourseCard';

	describe('CourseCard component', () => {
	  it('renders course info and link correctly', () => {
	    // 1. Arrange: Create a mock course object
	    const testCourse = {
	      id: 'algdat',
	      name: 'Algoritmer og datastrukturer',
	      subject_code: 'TDT4100',
	      description: 'heiheihei dette beskriver faget',
	    };

	    // 2. Act: Render the component within a router (so <Link> works)
	    render(
	      <MemoryRouter>
	        <CourseCard course={testCourse} />
	      </MemoryRouter>
	    );

	    // 3. Assert: Check that the text is rendered
	    expect(screen.getByText('Algoritmer og datastrukturer')).toBeInTheDocument();
	    expect(screen.getByText('TDT4100')).toBeInTheDocument();
	    expect(screen.getByText('heiheihei dette beskriver faget')).toBeInTheDocument();
        
	    // Check that the link has the correct "href"
	    // We look for a link role and see if it has the href pointing to /course/123
	    const linkElement = screen.getByRole('link', { name: /Algoritmer og datastrukturer/i });
	    expect(linkElement).toHaveAttribute('href', '/course/algdat');
	  });
});
