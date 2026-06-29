import { useState, useEffect } from 'preact/hooks';

import GameViewer from './GameViewer';

type GameStub = {
    id: string,
    north: string,
    south: string,
    status: string,
    nwin: boolean,
    length: number,
    created_at: string,
};

export default function Latest() {
    const [latest, setLatest] = useState([] as GameStub[]);

    useEffect(() => {
        fetch(import.meta.env.VITE_API_HOST + '/latest')
            .then(res => res.json())
            .then(data => {
                setLatest(data.latest || []);
            })
            .catch(console.error);
    }, []);

    return (
        <div>
            <div>
                {latest.length && <GameViewer gameId={latest[0].id} />}
            </div>
            {/*
            <div>
                <table class="text-left border-separate border-spacing-2">
                    <thead>
                        <tr>
                            <th>North</th>
                            <th>South</th>
                            <th>Winner</th>
                            <th>Length</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            latest.map(game => (
                                <tr>
                                    <td>S</td>
                                    <td>S</td>
                                    <td>N/A</td>
                                    <td>{game.length}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>*/}
        </div>
    );
}
