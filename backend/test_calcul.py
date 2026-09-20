
import pytest

from calcul import division


def test_division_normale():
    assert division(10, 2) == 5


def test_division_par_zero():
    with pytest.raises(ValueError):
        division(10, 0)