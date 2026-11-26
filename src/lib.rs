//! Each evidence bit describes one candidate consumer → provider relationship.
//! Node bits in the result identify consumers affected by the simulated outage.
struct Case {
    edges: [(u8, u8); 5],
    supported: u32,
}

const CASES: [Case; 3] = [
    Case { edges: [(0,1),(1,2),(0,3),(1,3),(3,2)], supported: 0b10011 },
    Case { edges: [(0,1),(0,2),(1,3),(2,3),(0,3)], supported: 0b01101 },
    Case { edges: [(0,2),(1,2),(0,3),(2,3),(1,3)], supported: 0b01011 },
];

#[no_mangle]
pub extern "C" fn missing(case: usize, chosen: u32) -> u32 {
    CASES.get(case).map_or(0, |c| c.supported & !chosen)
}

#[no_mangle]
pub extern "C" fn unsupported(case: usize, chosen: u32) -> u32 {
    CASES.get(case).map_or(0, |c| chosen & !c.supported)
}

#[no_mangle]
pub extern "C" fn impact(case: usize, chosen: u32, failed: u32) -> u32 {
    let Some(case) = CASES.get(case) else { return 0 };
    if failed >= 4 { return 0; }
    let mut affected = 1 << failed;
    loop {
        let before = affected;
        for (i, &(consumer, provider)) in case.edges.iter().enumerate() {
            if chosen & (1 << i) != 0 && affected & (1 << provider) != 0 {
                affected |= 1 << consumer;
            }
        }
        if before == affected { return affected; }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn shared_database_reaches_both_services() {
        assert_eq!(impact(0, 0b10011, 2), 0b1111);
        assert_eq!(impact(0, 0b10011, 0), 1);
    }
    #[test]
    fn removing_edge_changes_prediction() {
        assert_eq!(impact(2, 0b00011, 3), 0b1000);
        assert_eq!(impact(2, 0b01011, 3), 0b1111);
    }
    #[test]
    fn distinguish_missing_and_unsupported() {
        assert_eq!(missing(1, 0b00111), 0b01000);
        assert_eq!(unsupported(1, 0b00111), 0b00010);
    }
}
