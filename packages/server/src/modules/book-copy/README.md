Previous project function to calculate new code to assign to a book copy.

```php
     // returnMaxAssignedNumber
     // Questa funzione mi restitusce il primo numero di assegnazione disponibile
     // Mettendo withHoles a true,
     // @param bool $withoutHoles
     // @return string
     //
    public static function returnMaxAssignedNumber($withoutHoles = false)
    {
        $assigned_numbers = self::select("numero_assegnato", "stato_libro")
            // lo stato dei libri non deve essere "venduto" o una stringa vuota (è stato restituito durante la liquidazione)
            ->where("stato_libro", "!=", "venduto")->where("stato_libro", "!=", "")
            ->get();

        if ($assigned_numbers->isEmpty() || $withoutHoles) {
            $max_number = self::max('numero_assegnato');
            $numeration = explode('/', $max_number);
            $new_location = sprintf("%04d", $numeration[0] + 1);
            $max_assigned_number = $new_location . '/001';
        } else {
            $positions = [];
            foreach ($assigned_numbers as $assigned_number) {

                $positions[] = $assigned_number->numero_assegnato;

            }

            $numeration = explode('/', max($positions));

            $new_location = sprintf("%04d", (int)$numeration[0] + 1);

            for ($x = 1; $x <= (int)$numeration[0]; $x++) {
                $terzina_confronto = sprintf("%04d", $x);

                if (!preg_grep("/$terzina_confronto\//", $positions) == true) {
                    $new_location = $terzina_confronto;
                    break;
                }
            }

            $max_number = self::where("numero_assegnato", 'LIKE', "$new_location/%")->max('numero_assegnato');
            if ($max_number == null) {
                $max_assigned_number = $new_location . '/001';
            } else {
                $numeration = explode('/', $max_number);
                $max_assigned_number = $new_location . '/' . sprintf("%03d", $numeration[1] + 1);
            }


        }
        return $max_assigned_number;
    }
```
